from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.glazes.models import Glaze
from apps.glazes.permissions import IsGlazeOwnerOrReadOnly
from apps.glazes.serializers import GlazeSerializer


class GlazeViewSet(viewsets.ModelViewSet):
    queryset = Glaze.objects.all().order_by("-creation_date")
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
        serializer.save(posting_user=self.request.user)
