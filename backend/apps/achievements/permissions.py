from rest_framework.permissions import BasePermission


class IsAchievementOwnerOrReadOnly(BasePermission):
    message = "Only the achievement owner can edit or delete this achievement."

    def has_object_permission(self, request, view, obj):
        # Allow safe methods (GET, HEAD, OPTIONS)
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # Allow write operations only for the achievement owner
        return obj.user == request.user


class CanConfirmAchievement(BasePermission):
    message = "You can only confirm achievements of other users."

    def has_object_permission(self, request, view, obj):
        # Cannot confirm own achievement
        if obj.user == request.user:
            return False

        # Check if already confirmed
        if obj.achievementconfirmation_set.filter(user=request.user).exists():
            return False

        return True
