import csv
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.achievements.models import (
    Achievement,
    AchievementConfirmation,
    ConfirmationRequest,
)
from apps.glazes.models import Glaze
from apps.notifications.models import Notification
from apps.reactions.models import AchievementReaction, GlazeReaction, Reaction
from apps.tags.models import AchievementTag, GlazeTag, Tag
from apps.teams.models import Team, TeamLeader, TeamMember
from apps.users.models import Admin, User

MOCK_DATA_DIR = Path(__file__).resolve().parents[4] / "mock_data"


def split_list(value):
    if not value:
        return []
    return [item.strip() for item in value.split(";") if item.strip()]


def read_csv(name):
    with (MOCK_DATA_DIR / name).open(newline="") as csv_file:
        return list(csv.DictReader(csv_file))


class Command(BaseCommand):
    help = "Seed a small, realistic local development database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing app data before seeding mock data.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            self.reset_data()

        users = self.seed_users()
        teams = self.seed_teams(users)
        tags, reactions = self.seed_tags_and_reactions(users)
        achievements, glazes = self.seed_posts(users, tags, reactions)
        self.seed_notifications(achievements, glazes)

        self.stdout.write(
            self.style.SUCCESS(
                "Mock data ready: "
                f"{len(users)} users, {len(teams)} teams, "
                f"{len(tags)} tags, {len(reactions)} reactions, "
                f"{len(achievements)} achievements, {len(glazes)} glazes."
            )
        )

    def reset_data(self):
        self.stdout.write("Resetting existing app data...")
        Notification.objects.all().delete()
        AchievementReaction.objects.all().delete()
        GlazeReaction.objects.all().delete()
        AchievementTag.objects.all().delete()
        GlazeTag.objects.all().delete()
        ConfirmationRequest.objects.all().delete()
        AchievementConfirmation.objects.all().delete()
        Glaze.objects.all().delete()
        Achievement.objects.all().delete()
        Reaction.objects.all().delete()
        Tag.objects.all().delete()
        TeamLeader.objects.all().delete()
        TeamMember.objects.all().delete()
        Team.objects.all().delete()
        Admin.objects.all().delete()
        User.objects.all().delete()

    def seed_users(self):
        self.stdout.write("Seeding users...")
        users = {}

        for row in read_csv("mock_users.csv"):
            user, _ = User.objects.get_or_create(
                email=row["email"],
                defaults={"name": row["name"]},
            )
            user.name = row["name"]
            user.job_title = row["job_title"] or None
            user.bio_text = row["bio_text"] or None
            user.rank = int(row["rank"])
            user.active = row["active"].lower() == "true"
            user.deactivation_date = None if user.active else timezone.now()
            user.set_password(row["password"])
            user.save()

            if row["is_admin"].lower() == "true":
                Admin.objects.get_or_create(user=user)

            users[user.email] = user

        return users

    def seed_teams(self, users):
        self.stdout.write("Seeding teams...")
        teams = {}

        for row in read_csv("mock_team_names.csv"):
            team, _ = Team.objects.get_or_create(name=row["team_name"])
            teams[team.name] = team

            for email in split_list(row["members"]):
                TeamMember.objects.get_or_create(team=team, user=users[email])

            for email in split_list(row["leaders"]):
                user = users[email]
                TeamMember.objects.get_or_create(team=team, user=user)
                TeamLeader.objects.get_or_create(team=team, user=user)

        return teams

    def seed_tags_and_reactions(self, users):
        self.stdout.write("Seeding tags and reactions...")
        tags = {}
        reactions = {}
        first_user = next(iter(users.values()))

        for row in read_csv("mock_tags_reactions.csv"):
            if row["kind"] == "tag":
                tag, _ = Tag.objects.get_or_create(
                    tag_text=row["name"],
                    team=None,
                    defaults={"created_by": first_user},
                )
                if tag.created_by is None:
                    tag.created_by = first_user
                    tag.save(update_fields=["created_by"])
                tags[tag.tag_text] = tag
            elif row["kind"] == "reaction":
                reaction, _ = Reaction.objects.get_or_create(
                    code=row["code"],
                    defaults={"name": row["name"]},
                )
                if reaction.name != row["name"]:
                    reaction.name = row["name"]
                    reaction.save(update_fields=["name"])
                reactions[reaction.code] = reaction

        return tags, reactions

    def seed_posts(self, users, tags, reactions):
        self.stdout.write("Seeding achievements, glazes, tags, and reactions...")
        achievements = {}
        glazes = {}

        for row in read_csv("mock_posts.csv"):
            if row["type"] == "achievement":
                achievement = self.seed_achievement(row, users, tags, reactions)
                achievements[achievement.title] = achievement
            elif row["type"] == "glaze":
                glaze = self.seed_glaze(row, users, tags, reactions)
                glazes[glaze.title] = glaze

        return achievements, glazes

    def seed_achievement(self, row, users, tags, reactions):
        user = users[row["user_email"]]
        achievement, _ = Achievement.objects.get_or_create(
            user=user,
            title=row["title"],
            defaults={"body": row["body"]},
        )
        if achievement.body != row["body"]:
            achievement.body = row["body"]
            achievement.save(update_fields=["body"])

        for tag_name in split_list(row["tags"]):
            AchievementTag.objects.get_or_create(
                achievement=achievement,
                tag=tags[tag_name],
            )

        for email in split_list(row["confirmers"]):
            confirmer = users[email]
            if confirmer != user:
                AchievementConfirmation.objects.get_or_create(
                    achievement=achievement,
                    user=confirmer,
                )

        for email in split_list(row["requests"]):
            receiver = users[email]
            if receiver != user:
                ConfirmationRequest.objects.get_or_create(
                    achievement=achievement,
                    receiving_user=receiver,
                )

        for item in split_list(row["reactions"]):
            email, code = item.split(":")
            reactor = users[email]
            AchievementReaction.objects.get_or_create(
                achievement=achievement,
                user=reactor,
                reaction=reactions[code],
            )

        return achievement

    def seed_glaze(self, row, users, tags, reactions):
        posting_user = users[row["user_email"]]
        receiving_user = users[row["receiving_email"]]
        glaze, _ = Glaze.objects.get_or_create(
            posting_user=posting_user,
            receiving_user=receiving_user,
            title=row["title"],
            defaults={"body": row["body"]},
        )
        if glaze.body != row["body"]:
            glaze.body = row["body"]
            glaze.save(update_fields=["body"])

        for tag_name in split_list(row["tags"]):
            GlazeTag.objects.get_or_create(glaze=glaze, tag=tags[tag_name])

        for item in split_list(row["reactions"]):
            email, code = item.split(":")
            reactor = users[email]
            GlazeReaction.objects.get_or_create(
                glaze=glaze,
                user=reactor,
                reaction=reactions[code],
            )

        return glaze

    def seed_notifications(self, achievements, glazes):
        self.stdout.write("Seeding notifications...")

        for achievement in achievements.values():
            for confirmation in achievement.achievementconfirmation_set.all():
                Notification.objects.get_or_create(
                    recipient=achievement.user,
                    sender=confirmation.user,
                    notification_type="achievement_confirmed",
                    achievement=achievement,
                    defaults={
                        "title": "Achievement confirmed",
                        "message": (
                            f"{confirmation.user.name} confirmed your achievement: "
                            f"{achievement.title}"
                        ),
                    },
                )

            for request in achievement.confirmationrequest_set.all():
                Notification.objects.get_or_create(
                    recipient=request.receiving_user,
                    sender=achievement.user,
                    notification_type="confirmation_request",
                    achievement=achievement,
                    defaults={
                        "title": "Confirmation request",
                        "message": (
                            f"{achievement.user.name} asked you to confirm: "
                            f"{achievement.title}"
                        ),
                    },
                )

        for glaze in glazes.values():
            Notification.objects.get_or_create(
                recipient=glaze.receiving_user,
                sender=glaze.posting_user,
                notification_type="glaze_received",
                glaze=glaze,
                defaults={
                    "title": "New shout-out",
                    "message": f"{glaze.posting_user.name} glazed you: {glaze.title}",
                },
            )
