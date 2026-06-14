from rest_framework.permissions import BasePermission

from apps.teams.models import TeamLeader


class IsLeaderOfTeam(BasePermission):
    """
    Object-level permission — grants access only if the user
    leads the specific team being accessed.

    The view's object must be a Team instance.
    """

    message = "You must be a leader of this team to perform this action."

    def has_object_permission(self, request, view, obj):
        return TeamLeader.objects.filter(user=request.user, team=obj).exists()
