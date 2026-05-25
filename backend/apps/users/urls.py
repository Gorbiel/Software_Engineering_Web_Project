from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from apps.users.views import UserViewSet
from config.settings.common import MEDIA_ROOT, MEDIA_URL

router = DefaultRouter()
router.register("", UserViewSet, basename="users")

urlpatterns = router.urls + static(MEDIA_URL, document_root=MEDIA_ROOT)
