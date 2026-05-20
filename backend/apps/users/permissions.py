from rest_framework.permissions import BasePermission

from apps.users.models import Admin


class IsGlazedInAdmin(BasePermission):
    message = "Only GlazedIn admins can manage user accounts."

    def has_permission(self, request, view):
        user = request.user

        if not user or not getattr(user, "is_authenticated", True):
            return False

        return Admin.objects.filter(user=user).exists()

class IsSelf(BasePermission):
    message = "You can't access another user's data"

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not getattr(user, "is_authenticated", True):
            return False
        return obj == user