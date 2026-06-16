import logging

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.glazes.models import Glaze
from apps.glazes.permissions import IsGlazeOwnerOrReadOnly
from apps.glazes.serializers import GlazeSerializer
from apps.notifications.services import notify_glaze_reaction, notify_glaze_received
from apps.reactions.models import GlazeReaction
from apps.reactions.serializers import GlazeReactionSerializer
from apps.reactions.services import resolve_reaction_definition

logger = logging.getLogger(__name__)


class GlazeViewSet(viewsets.ModelViewSet):
    queryset = Glaze.glazes.all().order_by("-creation_date")
    serializer_class = GlazeSerializer
    permission_classes = [IsAuthenticated, IsGlazeOwnerOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by sent by user
        sent_by = self.request.query_params.get("sent_by")
        if sent_by:
            queryset = queryset.sent_by(int(sent_by))

        # Filter by received by user
        received_by = self.request.query_params.get("received_by")
        if received_by:
            queryset = queryset.received_by(int(received_by))

        # Filter by tag
        tag = self.request.query_params.get("tag")
        if tag:
            queryset = queryset.by_tag(tag)

        return queryset

    def perform_create(self, serializer):
        glaze = serializer.save(posting_user=self.request.user)
        # Notify the receiving user about the glaze
        try:
            notify_glaze_received(glaze)
        except Exception:
            logger.exception("Failed to send glaze notification")

    @action(detail=True, methods=["get", "post"], permission_classes=[IsAuthenticated])
    def reactions(self, request, pk=None):
        glaze = self.get_object()

        if request.method == "GET":
            reactions = glaze.glazereaction_set.select_related(
                "user", "reaction"
            ).order_by("-creation_date")
            serializer = GlazeReactionSerializer(reactions, many=True)
            return Response(serializer.data)

        reaction = resolve_reaction_definition(
            reaction_id=request.data.get("reaction_id"),
            code=request.data.get("code"),
            name=request.data.get("name"),
        )

        glaze_reaction = GlazeReaction.objects.filter(
            glaze=glaze,
            user=request.user,
            reaction=reaction,
        ).first()

        status_code = status.HTTP_200_OK
        if glaze_reaction is None:
            glaze_reaction = GlazeReaction.objects.create(
                glaze=glaze,
                user=request.user,
                reaction=reaction,
            )
            status_code = status.HTTP_201_CREATED
            # Notify glaze poster about reaction
            try:
                notify_glaze_reaction(glaze, request.user, reaction.name)
            except Exception:
                logger.exception("Failed to send glaze reaction notification")

        serializer = GlazeReactionSerializer(glaze_reaction)
        return Response(serializer.data, status=status_code)

    @action(
        detail=True,
        methods=["delete"],
        permission_classes=[IsAuthenticated],
        url_path=r"reactions/(?P<reaction_id>[0-9]+)",
    )
    def delete_reaction(self, request, pk=None, reaction_id=None):
        glaze = self.get_object()
        deleted, _ = GlazeReaction.objects.filter(
            id=reaction_id,
            glaze=glaze,
            user=request.user,
        ).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
