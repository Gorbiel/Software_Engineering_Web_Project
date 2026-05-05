import csv
import random
import django

django.setup()

from core.models import *

if __name__ == "__main__":
    mock_user_csv = csv.reader(open("mock_data/mock_users.csv"), delimiter=",")
    mock_post_csv = csv.reader(open("mock_data/mock_posts.csv"), delimiter=",")
    mock_teams_csv = set(name[0] for name in csv.reader(open("mock_data/mock_team_names.csv"), delimiter=","))
    mock_reactions_tags = set(text[0] for text in csv.reader(open("mock_data/mock_tags_reactions.csv"), delimiter=","))

    users = []
    print("Generating users")
    for name, email, password in mock_user_csv:
        user = User(name=name, email=email, password=password)
        user.full_clean()
        user.save()
        users.append(user)
        if random.random() < 0.1:
            admin = Admin(user_id=user)
            admin.save()
    print("Generating teams")
    for name in mock_teams_csv:
        team = Team(name=name)
        team.full_clean()
        team.save()
        members = list(set([random.choice(users) for i in range(2, random.randint(3, 40))]))
        leader = TeamLeader(team_id=team, user_id=members[0])
        leader.full_clean()
        leader.save()
        for m in members:
            member = TeamMember(team_id=team, user_id=m, rank=random.randint(0, 10))
            member.full_clean()
            member.save()

    achievements = []
    glazes = []
    print("generating posts")
    for title, body in mock_post_csv:
        if random.random() < 0.5:
            user = random.choice(users)
            achievement = Achievement(user_id=user, title=title, body=body)
            achievement.full_clean()
            achievement.save()
            achievements.append(achievement)
            conf_users = list(set([random.choice(users) for i in range(2, random.randint(0, 10))]) - {user})
            for u in conf_users:
                confirmation = AchievementConfirmation(achievement_id=achievement, user_id=u)
                confirmation.full_clean()
                confirmation.save()
            conf_users = list(set([random.choice(users) for i in range(2, random.randint(0, 10))]) - {user})
            for u in conf_users:
                confirmation = ConfirmationRequest(achievement_id=achievement, receiving_user_id=u)
                confirmation.full_clean()
                confirmation.save()

        else:
            receiving_user = random.choice(users)
            sending_user = random.choice(users)
            while sending_user == receiving_user:
                sending_user = random.choice(users)
            glaze = Glaze(posting_user_id=sending_user, receiving_user_id=receiving_user, title=title, body=body)
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
                    achievement_tag = AchievementTag(achievement_id=achievement, tag_id=tag)
                    achievement_tag.full_clean()
                    achievement_tag.save()
                else:
                    glaze = random.choice(glazes)
                    glaze_tag = GlazeTag(glaze_id=glaze, tag_id=tag)
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
                    achievement_tag = AchievementReaction(achievement_id=achievement, reaction_id=reaction, user_id=user)
                    achievement_tag.full_clean()
                    achievement_tag.save()
                else:
                    glaze = random.choice(glazes)
                    glaze_reaction = GlazeReaction(glaze_id=glaze, reaction_id=reaction, user_id=user)
                    glaze_reaction.full_clean()
                    glaze_reaction.save()

    print("generating inacive users")
    for i in range(50):
        users[i].active = False
        users[i].save()







