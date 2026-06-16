from rest_framework import status
from rest_framework.test import APITestCase

from apps.glazes.models import Glaze
from apps.reactions.models import GlazeReaction, Reaction
from apps.tags.models import GlazeTag, Tag
from apps.users.models import Admin, User


class GlazeViewSetTests(APITestCase):
    def setUp(self):
        self.sender = User.objects.create_user(
            email="sender@example.com",
            name="Sender",
            password="password123",
        )
        self.receiver = User.objects.create_user(
            email="receiver@example.com",
            name="Receiver",
            password="password123",
        )

    def login(self, email="sender@example.com", password="password123"):
        response = self.client.post(
            "/api/auth/login/",
            {"email": email, "password": password},
            format="json",
        )
        return response.data["access"]

    def test_create_glaze_with_tags(self):
        token = self.login()
        tag = Tag.objects.create(tag_text="Helpful", created_by=self.sender)

        response = self.client.post(
            "/api/glazes/",
            {
                "receiving_user_id": self.receiver.id,
                "title": "Tagged Glaze",
                "body": "Great work",
                "tag_ids": [tag.id],
            },
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            GlazeTag.objects.filter(
                glaze_id=response.data["id"],
                tag=tag,
            ).exists()
        )


class GlazeReactionTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com",
            name="Owner",
            password="password123",
        )
        self.receiver = User.objects.create_user(
            email="receiver@example.com",
            name="Receiver",
            password="password123",
        )
        self.reactor = User.objects.create_user(
            email="reactor@example.com",
            name="Reactor",
            password="password123",
        )
        self.glaze = Glaze.objects.create(
            posting_user=self.owner,
            receiving_user=self.receiver,
            title="Helpful glaze",
            body="Needs a heart",
        )

    def login(self, email="reactor@example.com", password="password123"):
        response = self.client.post(
            "/api/auth/login/",
            {"email": email, "password": password},
            format="json",
        )
        return response.data["access"]

    def test_add_reaction_to_glaze(self):
        token = self.login()

        response = self.client.post(
            f"/api/glazes/{self.glaze.id}/reactions/",
            {"code": "heart", "name": "Heart"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["reaction"]["code"], "heart")
        self.assertTrue(
            GlazeReaction.objects.filter(
                glaze=self.glaze,
                user=self.reactor,
                reaction__code="heart",
            ).exists()
        )

    def test_retrieve_glaze_includes_reactions(self):
        token = self.login(email="owner@example.com")
        reaction = Reaction.objects.create(name="Heart", code="heart")
        GlazeReaction.objects.create(
            glaze=self.glaze,
            user=self.reactor,
            reaction=reaction,
        )

        response = self.client.get(
            f"/api/glazes/{self.glaze.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["reaction_count"], 1)
        self.assertEqual(len(response.data["reactions"]), 1)
        self.assertEqual(response.data["reactions"][0]["reaction"]["code"], "heart")

    def test_delete_own_glaze_reaction(self):
        token = self.login()
        reaction = Reaction.objects.create(name="Heart", code="heart")
        glaze_reaction = GlazeReaction.objects.create(
            glaze=self.glaze,
            user=self.reactor,
            reaction=reaction,
        )

        response = self.client.delete(
            f"/api/glazes/{self.glaze.id}/reactions/{glaze_reaction.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(GlazeReaction.objects.filter(id=glaze_reaction.id).exists())

    def test_cannot_delete_someone_elses_glaze_reaction(self):
        owner_token = self.login(email="owner@example.com")
        reaction = Reaction.objects.create(name="Heart", code="heart")
        glaze_reaction = GlazeReaction.objects.create(
            glaze=self.glaze,
            user=self.reactor,
            reaction=reaction,
        )

        response = self.client.delete(
            f"/api/glazes/{self.glaze.id}/reactions/{glaze_reaction.id}/",
            HTTP_AUTHORIZATION=f"Bearer {owner_token}",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(GlazeReaction.objects.filter(id=glaze_reaction.id).exists())


class GlazeModerationTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com",
            name="Owner",
            password="password123",
        )
        self.receiver = User.objects.create_user(
            email="receiver@example.com",
            name="Receiver",
            password="password123",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            name="Other",
            password="password123",
        )
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            name="Admin",
            password="password123",
        )
        Admin.objects.create(user=self.admin_user)

        self.glaze = Glaze.objects.create(
            posting_user=self.owner,
            receiving_user=self.receiver,
            title="Kudos",
            body="Great work",
        )

    def login(self, email, password="password123"):
        response = self.client.post(
            "/api/auth/login/",
            {"email": email, "password": password},
            format="json",
        )
        return response.data["access"]

    def test_admin_can_delete_foreign_glaze(self):
        token = self.login(email="admin@example.com")

        response = self.client.delete(
            f"/api/glazes/{self.glaze.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Glaze.objects.filter(id=self.glaze.id).exists())

    def test_admin_cannot_patch_foreign_glaze(self):
        token = self.login(email="admin@example.com")

        response = self.client.patch(
            f"/api/glazes/{self.glaze.id}/",
            {"title": "Updated by admin"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_owner_non_admin_cannot_delete_foreign_glaze(self):
        token = self.login(email="other@example.com")

        response = self.client.delete(
            f"/api/glazes/{self.glaze.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
