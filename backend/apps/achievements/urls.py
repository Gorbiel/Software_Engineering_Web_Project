from rest_framework.routers import DefaultRouter

from apps.achievements.views import AchievementSearchViewSet, AchievementViewSet

router = DefaultRouter()
router.register("search", AchievementSearchViewSet, basename="achievement-search")
router.register("", AchievementViewSet, basename="achievements")

urlpatterns = router.urls
