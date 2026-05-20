from rest_framework.routers import DefaultRouter

from apps.users.views import ProfileViewSet, UserViewSet

router = DefaultRouter()
router.register("", UserViewSet, basename="users")
router.register("", ProfileViewSet, basename="users")

urlpatterns = router.urls
