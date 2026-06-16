from rest_framework import serializers
from apps.notifications.models import Notification
from apps.users.serializers import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'sender',
            'notification_type',
            'title',
            'message',
            'achievement',
            'glaze',
            'is_read',
            'creation_date',
            'read_date',
        ]
        read_only_fields = [
            'id',
            'recipient',
            'sender',
            'notification_type',
            'title',
            'message',
            'achievement',
            'glaze',
            'creation_date',
        ]


class NotificationMarkReadSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )

# Made with Bob
