from django.db import models
from apps.users.models import User
from apps.achievements.models import Achievement
from apps.glazes.models import Glaze


class NotificationQuerySet(models.QuerySet):
    def unread(self):
        return self.filter(is_read=False)
    
    def read(self):
        return self.filter(is_read=True)
    
    def for_user(self, user):
        return self.filter(recipient=user)


class Notification(models.Model):
    """
    Notification model for user notifications
    """
    
    NOTIFICATION_TYPES = [
        ('achievement_created', 'Achievement Created'),
        ('achievement_confirmed', 'Achievement Confirmed'),
        ('achievement_reaction', 'Achievement Reaction'),
        ('glaze_received', 'Glaze Received'),
        ('glaze_reaction', 'Glaze Reaction'),
        ('confirmation_request', 'Confirmation Request'),
        ('mention', 'User Mentioned'),
    ]
    
    recipient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    sender = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='sent_notifications',
        null=True,
        blank=True
    )
    notification_type = models.CharField(
        max_length=32, 
        choices=NOTIFICATION_TYPES
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Optional references to related objects
    achievement = models.ForeignKey(
        Achievement, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True
    )
    glaze = models.ForeignKey(
        Glaze, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True
    )
    
    is_read = models.BooleanField(default=False)
    creation_date = models.DateTimeField(auto_now_add=True)
    read_date = models.DateTimeField(null=True, blank=True)
    
    objects = models.Manager()
    notifications = NotificationQuerySet.as_manager()
    
    class Meta:
        ordering = ['-creation_date']
        indexes = [
            models.Index(fields=['recipient', '-creation_date']),
            models.Index(fields=['recipient', 'is_read']),
        ]
    
    def __str__(self):
        return f"{self.notification_type} for {self.recipient.name}"

# Made with Bob
