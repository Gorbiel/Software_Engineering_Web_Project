from rest_framework.permissions import BasePermission

from apps.users.models import Admin


class IsGlazeOwnerOrReadOnly(BasePermission):
    message = "Only the posting user can edit or delete this glaze."

    def has_object_permission(self, request, view, obj):
        # Allow safe methods (GET, HEAD, OPTIONS)
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # Admins can moderate by deleting any glaze.
        if request.method == "DELETE":
            if Admin.objects.filter(user=request.user).exists():
                return True

        # Allow write operations only for the posting user
        return obj.posting_user == request.user
