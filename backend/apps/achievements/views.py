import logging

from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.achievements.models import (
    Achievement,
    AchievementConfirmation,
    ConfirmationRequest,
)
from apps.achievements.permissions import (
    CanConfirmAchievement,
    IsAchievementOwnerOrReadOnly,
)
from apps.achievements.serializers import (
    AchievementConfirmationSerializer,
    AchievementSearchSerializer,
    AchievementSerializer,
    ConfirmationRequestSerializer,
)
from apps.notifications.services import (
    notify_achievement_confirmed,
    notify_achievement_reaction,
    notify_confirmation_request,
)
from apps.reactions.models import AchievementReaction
from apps.reactions.serializers import AchievementReactionSerializer
from apps.reactions.services import resolve_reaction_definition
from common.pagination import SearchResultsSetPagination

logger = logging.getLogger(__name__)


class AchievementSearchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Search achievements (posts) by title, body, or user name.

    Query parameters:
    - q: Search query (required)
    - sort_by: 'creation_date', 'confirmation_count', 'title' (default: 'creation_date')
    - order: 'asc', 'desc' (default: 'desc')
    - page_size: Number of results per page (default: 20, max: 100)
    - confirmed: 'true', 'false' (optional, filters by confirmation status)
    - min_confirmations: Minimum number of confirmations (optional)
    """

    queryset = Achievement.objects.all().order_by("-creation_date")
    serializer_class = AchievementSearchSerializer
    pagination_class = SearchResultsSetPagination

    SORT_OPTIONS = ["creation_date", "title"]
    FILTER_OPTIONS = ["confirmed", "min_confirmations"]

    @action(detail=False, methods=["get"])
    def filters_and_sorting(self, request):
        """Expose available filters and sorting options for the frontend."""
        return Response(
            {
                "sort_options": self.SORT_OPTIONS,
                "filter_options": self.FILTER_OPTIONS,
            }
        )

    def get_queryset(self):
        queryset = Achievement.objects.all()
        search_query = self.request.query_params.get("q", "").strip()

        if not search_query:
            return queryset.none()

        # Search across multiple fields
        queryset = queryset.filter(
            Q(title__icontains=search_query)
            | Q(body__icontains=search_query)
            | Q(user__name__icontains=search_query)
        )

        # Filter by confirmation status if provided
        confirmed = self.request.query_params.get("confirmed")
        if confirmed == "true":
            queryset = queryset.confirmed()
        elif confirmed == "false":
            queryset = queryset.unconfirmed()

        # Filter by minimum confirmations if provided
        min_confirmations = self.request.query_params.get("min_confirmations")
        if min_confirmations:
            try:
                min_confirmations = int(min_confirmations)
                queryset = queryset.with_confirmation_count()
                queryset = queryset.filter(confirmation_count__gte=min_confirmations)
            except ValueError, TypeError:
                pass

        # Sorting
        sort_by = self.request.query_params.get("sort_by", "creation_date")
        if sort_by == "confirmation_count":
            # confirmation_count requires annotation
            queryset = queryset.with_confirmation_count()
        if sort_by not in self.SORT_OPTIONS and sort_by != "confirmation_count":
            sort_by = "creation_date"

        order = self.request.query_params.get("order", "desc")
        if order == "asc":
            queryset = queryset.order_by(sort_by)
        else:
            queryset = queryset.order_by(f"-{sort_by}")

        return queryset


class AchievementViewSet(viewsets.ModelViewSet):
    queryset = Achievement.objects.all().order_by("-creation_date")
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated, IsAchievementOwnerOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by user if provided
        user_id = self.request.query_params.get("user_id")
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # Filter by tag if provided
        tag = self.request.query_params.get("tag")
        if tag:
            queryset = queryset.by_tag(tag)

        # Filter confirmed/unconfirmed if provided
        confirmed = self.request.query_params.get("confirmed")
        if confirmed == "true":
            queryset = queryset.confirmed()
        elif confirmed == "false":
            queryset = queryset.unconfirmed()

        return queryset

    def perform_create(self, serializer):
        achievement = serializer.save(user=self.request.user)
        # Notify team members about new achievement
        from apps.notifications.services import notify_achievement_created

        try:
            notify_achievement_created(achievement)
        except Exception:
            logger.exception("Failed to send achievement creation notifications")

    @action(detail=True, methods=["get", "post"], permission_classes=[IsAuthenticated])
    def reactions(self, request, pk=None):
        achievement = self.get_object()

        if request.method == "GET":
            reactions = achievement.achievementreaction_set.select_related(
                "user", "reaction"
            ).order_by("-creation_date")
            serializer = AchievementReactionSerializer(reactions, many=True)
            return Response(serializer.data)

        reaction = resolve_reaction_definition(
            reaction_id=request.data.get("reaction_id"),
            code=request.data.get("code"),
            name=request.data.get("name"),
        )

        achievement_reaction = AchievementReaction.objects.filter(
            achievement=achievement,
            user=request.user,
            reaction=reaction,
        ).first()

        status_code = status.HTTP_200_OK
        if achievement_reaction is None:
            achievement_reaction = AchievementReaction.objects.create(
                achievement=achievement,
                user=request.user,
                reaction=reaction,
            )
            status_code = status.HTTP_201_CREATED
            # Notify achievement owner about reaction
            try:
                notify_achievement_reaction(achievement, request.user, reaction.name)
            except Exception:
                logger.exception("Failed to send reaction notification")

        serializer = AchievementReactionSerializer(achievement_reaction)
        return Response(serializer.data, status=status_code)

    @action(
        detail=True,
        methods=["delete"],
        permission_classes=[IsAuthenticated],
        url_path=r"reactions/(?P<reaction_id>[0-9]+)",
    )
    def delete_reaction(self, request, pk=None, reaction_id=None):
        achievement = self.get_object()
        deleted, _ = AchievementReaction.objects.filter(
            id=reaction_id,
            achievement=achievement,
            user=request.user,
        ).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="confirmation-requests",
    )
    def confirmation_requests(self, request):
        """List confirmation requests addressed to the authenticated user."""
        queryset = (
            ConfirmationRequest.objects.filter(receiving_user=request.user)
            .select_related("achievement", "achievement__user")
            .order_by("-creation_date")
        )
        serializer = ConfirmationRequestSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=["delete"],
        permission_classes=[IsAuthenticated],
        url_path="confirmation-requests/clear",
    )
    def clear_confirmation_requests(self, request):
        """Delete all confirmation requests addressed to the authenticated user."""
        ConfirmationRequest.objects.filter(receiving_user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=False,
        methods=["delete"],
        permission_classes=[IsAuthenticated],
        url_path="confirmation-requests/(?P<request_id>[0-9]+)",
    )
    def delete_confirmation_request(self, request, request_id=None):
        """Delete a single confirmation request addressed to the authenticated user."""
        deleted, _ = ConfirmationRequest.objects.filter(
            id=request_id, receiving_user=request.user
        ).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def confirmations_request(self, request, pk=None):
        """Request a specific user to confirm this achievement"""
        achievement = self.get_object()

        # Only the achievement owner can request confirmation for it
        if achievement.user != request.user:
            return Response(
                {"detail": "You can only request confirmation for your \
                 own achievement."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        receiving_user_id = request.data.get("receiving_user_id")
        if not receiving_user_id:
            return Response(
                {"detail": "receiving_user_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from apps.users.models import User

            receiving_user = User.objects.get(id=receiving_user_id)
            confirmation_request = ConfirmationRequest.objects.create(
                achievement=achievement, receiving_user_id=receiving_user_id
            )
            # Notify the receiving user
            try:
                notify_confirmation_request(achievement, receiving_user)
            except Exception:
                logger.exception("Failed to send confirmation request notification")
            serializer = ConfirmationRequestSerializer(confirmation_request)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception:
            logger.exception("Failed to create confirmation request.")
            return Response(
                {"detail": "Unable to create confirmation request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["get", "post"], permission_classes=[IsAuthenticated])
    def confirmations(self, request, pk=None):
        """Get confirmations or add a new confirmation for this achievement"""
        achievement = self.get_object()

        if request.method == "GET":
            confirmations = achievement.achievementconfirmation_set.all()
            serializer = AchievementConfirmationSerializer(confirmations, many=True)
            return Response(serializer.data)

        elif request.method == "POST":
            # Check permissions
            permission = CanConfirmAchievement()
            if not permission.has_object_permission(request, self, achievement):
                return Response(
                    {"detail": permission.message},
                    status=status.HTTP_403_FORBIDDEN,
                )

            try:
                confirmation = AchievementConfirmation.objects.create(
                    achievement=achievement, user=request.user
                )
                # Notify achievement owner about confirmation
                try:
                    notify_achievement_confirmed(achievement, request.user)
                except Exception:
                    logger.exception("Failed to send confirmation notification")
                serializer = AchievementConfirmationSerializer(confirmation)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception:
                logger.exception("Failed to create achievement confirmation.")
                return Response(
                    {"detail": "Unable to create confirmation."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
