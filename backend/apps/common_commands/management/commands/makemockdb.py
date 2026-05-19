import csv
import random

from django.core.management.base import BaseCommand

from apps.achievements.models import (
    Achievement,
    AchievementConfirmation,
    ConfirmationRequest,
)
from apps.glazes.models import Glaze
from apps.reactions.models import (
    AchievementReaction,
    GlazeReaction,
    Reaction,
)
from apps.tags.models import (
    AchievementTag,
    GlazeTag,
    Tag,
)
from apps.teams.models import Team, TeamLeader, TeamMember
from apps.users.models import Admin, User


class Command(BaseCommand):
    help = "Does whatever your script does"

    def handle(self, *args, **options):
        random.seed(123456789)
        mock_user_csv = csv.reader(open("mock_data/mock_users.csv"), delimiter=",")
        mock_post_csv = csv.reader(open("mock_data/mock_posts.csv"), delimiter=",")
        mock_teams_csv = set(
            name[0]
            for name in csv.reader(open("mock_data/mock_team_names.csv"), delimiter=",")
        )
        mock_reactions_tags = set(
            text[0]
            for text in csv.reader(
                open("mock_data/mock_tags_reactions.csv"), delimiter=","
            )
        )

        users = []
        print("Generating users")
        for name, email, password in mock_user_csv:
            user = User.objects.create_user(
                name=name,
                email=email,
                password=password,
            )
            users.append(user)
            if random.random() < 0.1:
                admin = Admin(user=user)
                admin.save()
        print("Generating teams")
        for name in mock_teams_csv:
            team = Team(name=name)
            team.full_clean()
            team.save()
            members = list(
                set([random.choice(users) for i in range(2, random.randint(3, 40))])
            )
            leader = TeamLeader(team=team, user=members[0])
            leader.full_clean()
            leader.save()
            for m in members:
                member = TeamMember(team=team, user=m, rank=random.randint(0, 10))
                member.full_clean()
                member.save()

        achievements = []
        glazes = []
        print("generating posts")
        for title, body in mock_post_csv:
            if random.random() < 0.5:
                user = random.choice(users)
                achievement = Achievement(user=user, title=title, body=body)
                achievement.full_clean()
                achievement.save()
                achievements.append(achievement)
                conf_users = list(
                    set([random.choice(users) for i in range(2, random.randint(0, 10))])
                    - {user}
                )
                for u in conf_users:
                    confirmation = AchievementConfirmation(
                        achievement=achievement, user=u
                    )
                    confirmation.full_clean()
                    confirmation.save()
                conf_users = list(
                    set([random.choice(users) for i in range(2, random.randint(0, 10))])
                    - {user}
                )
                for u in conf_users:
                    confirmation = ConfirmationRequest(
                        achievement=achievement, receiving_user=u
                    )
                    confirmation.full_clean()
                    confirmation.save()

            else:
                receiving_user = random.choice(users)
                sending_user = random.choice(users)
                while sending_user == receiving_user:
                    sending_user = random.choice(users)
                glaze = Glaze(
                    posting_user=sending_user,
                    receiving_user=receiving_user,
                    title=title,
                    body=body,
                )
                glaze.full_clean()
                glaze.save()
                glazes.append(glaze)

        print("Generating tags and reactions")
        for text in mock_reactions_tags:
            if random.random() < 0.5:
                tag = Tag(tag_text=text)
                tag.full_clean()
                tag.save()
                for i in range(random.randint(0, 100)):
                    if random.random() < 0.5:
                        achievement = random.choice(achievements)
                        achievement_tag = AchievementTag(
                            achievement=achievement, tag=tag
                        )
                        achievement_tag.full_clean()
                        achievement_tag.save()
                    else:
                        glaze = random.choice(glazes)
                        glaze_tag = GlazeTag(glaze=glaze, tag=tag)
                        glaze_tag.full_clean()
                        glaze_tag.save()
            else:
                user = random.choice(users)
                reaction = Reaction(name=text, code=f":{text}:")
                reaction.full_clean()
                reaction.save()
                for i in range(random.randint(0, 100)):
                    if random.random() < 0.5:
                        achievement = random.choice(achievements)
                        achievement_tag = AchievementReaction(
                            achievement=achievement, reaction=reaction, user=user
                        )
                        achievement_tag.full_clean()
                        achievement_tag.save()
                    else:
                        glaze = random.choice(glazes)
                        glaze_reaction = GlazeReaction(
                            glaze=glaze, reaction=reaction, user=user
                        )
                        glaze_reaction.full_clean()
                        glaze_reaction.save()

        print("generating inactive users")
        for user in users[:50]:
            user.active = False
            user.save()
