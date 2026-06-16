from rest_framework.routers import DefaultRouter

from apps.teams.views import TeamSearchViewSet, TeamViewSet

router = DefaultRouter()
router.register("search", TeamSearchViewSet, basename="team-search")
router.register("team", TeamViewSet, basename="team-legacy")
router.register("", TeamViewSet, basename="team")

urlpatterns = router.urls
