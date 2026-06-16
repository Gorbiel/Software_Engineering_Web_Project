# Generated migration for tag scope and metadata

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tags", "0001_initial"),
        ("teams", "0005_remove_teammember_rank"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Remove unique constraint on tag_text
        migrations.AlterField(
            model_name="tag",
            name="tag_text",
            field=models.CharField(max_length=64),
        ),
        # Add team field for scope
        migrations.AddField(
            model_name="tag",
            name="team",
            field=models.ForeignKey(
                blank=True,
                help_text="If null, tag is global. Otherwise, tag is team-specific.",
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="teams.team",
            ),
        ),
        # Add created_by field
        migrations.AddField(
            model_name="tag",
            name="created_by",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="created_tags",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        # Add unique constraint for tag_text per scope
        migrations.AddConstraint(
            model_name="tag",
            constraint=models.UniqueConstraint(
                fields=["tag_text", "team"], name="unique_tag_per_scope"
            ),
        ),
        # Add ordering
        migrations.AlterModelOptions(
            name="tag",
            options={"ordering": ["tag_text"]},
        ),
        # Add added_date to AchievementTag
        migrations.AddField(
            model_name="achievementtag",
            name="added_date",
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        # Add unique_together for AchievementTag
        migrations.AlterUniqueTogether(
            name="achievementtag",
            unique_together={("achievement", "tag")},
        ),
        # Add ordering for AchievementTag
        migrations.AlterModelOptions(
            name="achievementtag",
            options={"ordering": ["added_date"]},
        ),
        # Update related_name for AchievementTag
        migrations.AlterField(
            model_name="achievementtag",
            name="achievement",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="achievement_tags",
                to="achievements.achievement",
            ),
        ),
        # Add added_date to GlazeTag
        migrations.AddField(
            model_name="glazetag",
            name="added_date",
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        # Add unique_together for GlazeTag
        migrations.AlterUniqueTogether(
            name="glazetag",
            unique_together={("glaze", "tag")},
        ),
        # Add ordering for GlazeTag
        migrations.AlterModelOptions(
            name="glazetag",
            options={"ordering": ["added_date"]},
        ),
        # Update related_name for GlazeTag
        migrations.AlterField(
            model_name="glazetag",
            name="glaze",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="glaze_tags",
                to="glazes.glaze",
            ),
        ),
    ]


# Made with Bob
