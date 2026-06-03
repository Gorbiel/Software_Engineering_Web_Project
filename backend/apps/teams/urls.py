from django.urls import path

from apps.teams.views import TeamMemberRankUpdateView

urlpatterns = [
    path(
        "<int:team_id>/members/<int:user_id>/rank/",
        TeamMemberRankUpdateView.as_view(),
        name="team-member-rank-update",
    ),
]
