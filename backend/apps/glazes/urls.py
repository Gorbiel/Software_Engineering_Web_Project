from rest_framework.routers import DefaultRouter

from apps.glazes.views import GlazeViewSet

router = DefaultRouter()
router.register("", GlazeViewSet, basename="glazes")

urlpatterns = router.urls
