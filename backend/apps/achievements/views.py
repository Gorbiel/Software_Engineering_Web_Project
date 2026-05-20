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
    AchievementSerializer,
    ConfirmationRequestSerializer,
)


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
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def confirmations_request(self, request, pk=None):
        """Request a specific user to confirm this achievement"""
        achievement = self.get_object()

        # Check if user is trying to request confirmation for their own achievement
        if achievement.user == request.user:
            return Response(
                {"detail": "Cannot request confirmation for your own achievement."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        receiving_user_id = request.data.get("receiving_user_id")
        if not receiving_user_id:
            return Response(
                {"detail": "receiving_user_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            confirmation_request = ConfirmationRequest.objects.create(
                achievement=achievement, receiving_user_id=receiving_user_id
            )
            serializer = ConfirmationRequestSerializer(confirmation_request)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST
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
                serializer = AchievementConfirmationSerializer(confirmation)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST
                )