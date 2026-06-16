from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from apps.users.leaderboard import LeaderboardViewSet
from apps.users.views import ProfileViewSet, UserSearchViewSet, UserViewSet
from config.settings.common import MEDIA_ROOT, MEDIA_URL

router = DefaultRouter()
router.register("search", UserSearchViewSet, basename="user-search")
router.register("leaderboard", LeaderboardViewSet, basename="leaderboard")
router.register("", UserViewSet, basename="users")
router.register("", ProfileViewSet, basename="profile")

urlpatterns = router.urls + static(MEDIA_URL, document_root=MEDIA_ROOT)
