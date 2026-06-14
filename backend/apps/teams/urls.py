from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.teams.views import TeamMemberRankUpdateView, TeamSearchViewSet, TeamViewSet

router = DefaultRouter()
router.register("search", TeamSearchViewSet, basename="team-search")
router.register("team", TeamViewSet, basename="team")

urlpatterns = router.urls + [
    path(
        "<int:team_id>/members/<int:user_id>/rank/",
        TeamMemberRankUpdateView.as_view(),
        name="team-member-rank-update",
    ),
]
