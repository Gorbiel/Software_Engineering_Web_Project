from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.notifications.serializers import (
    NotificationMarkReadSerializer,
    NotificationSerializer,
)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing user notifications
    """

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.notifications.for_user(self.request.user).select_related(
            "sender", "achievement", "glaze"
        )

    @action(detail=False, methods=["get"])
    def unread(self, request):
        """Get all unread notifications for the current user"""
        notifications = self.get_queryset().unread()
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().unread().count()
        return Response({"count": count})

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        """Mark a single notification as read"""
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.read_date = timezone.now()
            notification.save(update_fields=["is_read", "read_date"])
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        serializer = NotificationMarkReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        notification_ids = serializer.validated_data.get("notification_ids")

        queryset = self.get_queryset().unread()

        if notification_ids:
            queryset = queryset.filter(id__in=notification_ids)

        updated_count = queryset.update(is_read=True, read_date=timezone.now())

        return Response(
            {
                "marked_read": updated_count,
                "message": f"{updated_count} notification(s) marked as read",
            }
        )

    @action(detail=False, methods=["delete"])
    def clear_read(self, request):
        """Delete all read notifications"""
        deleted_count, _ = self.get_queryset().read().delete()
        return Response(
            {
                "deleted": deleted_count,
                "message": f"{deleted_count} notification(s) deleted",
            },
            status=status.HTTP_200_OK,
        )


# Made with Bob
