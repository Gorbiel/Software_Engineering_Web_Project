from django.db import migrations


def normalize_ranks(apps, schema_editor):
    team_member = apps.get_model("teams", "TeamMember")
    # Set any rank values below 1 to 1, and any above 100 to 100.
    team_member.objects.filter(rank__lt=1).update(rank=1)
    team_member.objects.filter(rank__gt=100).update(rank=100)


def noop_reverse(apps, schema_editor):
    # No-op reverse; we don't attempt to restore previous values.
    pass


class Migration(migrations.Migration):
    dependencies = [("teams", "0002_initial")]

    operations = [migrations.RunPython(normalize_ranks, reverse_code=noop_reverse)]
