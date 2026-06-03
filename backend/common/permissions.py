from rest_framework.permissions import BasePermission

from apps.users.models import Admin


class IsGlazedInAdmin(BasePermission):
    """Allow access only to GlazedIn admin users.

    This checks that request.user is authenticated and that there exists an
    Admin object referencing that user.
    """

    message = "Only GlazedIn admins can manage user accounts."

    def has_permission(self, request, view):
        user = request.user

        # Deny if there's no user or the user is not authenticated.
        if not user or not getattr(user, "is_authenticated", False):
            return False

        return Admin.objects.filter(user=user).exists()


class IsSelf(BasePermission):
    """Allow access only when the object is the requesting user."""

    message = "You can't access another user's data"

    def has_object_permission(self, request, view, obj):
        user = request.user
        # Deny if there's no user or the user is not authenticated.
        if not user or not getattr(user, "is_authenticated", False):
            return False
        return obj == user
