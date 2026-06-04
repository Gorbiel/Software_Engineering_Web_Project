from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.teams.views import TeamMemberRankUpdateView, TeamSearchViewSet

router = DefaultRouter()
router.register("search", TeamSearchViewSet, basename="team-search")

urlpatterns = router.urls + [
    path(
        "<int:team_id>/members/<int:user_id>/rank/",
        TeamMemberRankUpdateView.as_view(),
        name="team-member-rank-update",
    ),
]
