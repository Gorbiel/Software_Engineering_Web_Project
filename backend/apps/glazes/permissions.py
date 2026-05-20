from rest_framework.permissions import BasePermission


class IsGlazeOwnerOrReadOnly(BasePermission):
    message = "Only the posting user can edit or delete this glaze."

    def has_object_permission(self, request, view, obj):
        # Allow safe methods (GET, HEAD, OPTIONS)
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # Allow write operations only for the posting user
        return obj.posting_user == request.user
