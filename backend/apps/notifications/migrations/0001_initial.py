# Generated migration for notifications app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('achievements', '0003_add_achievement_validation_triggers'),
        ('glazes', '0002_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('achievement_created', 'Achievement Created'), ('achievement_confirmed', 'Achievement Confirmed'), ('achievement_reaction', 'Achievement Reaction'), ('glaze_received', 'Glaze Received'), ('glaze_reaction', 'Glaze Reaction'), ('confirmation_request', 'Confirmation Request'), ('mention', 'User Mentioned')], max_length=32)),
                ('title', models.CharField(max_length=255)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('creation_date', models.DateTimeField(auto_now_add=True)),
                ('read_date', models.DateTimeField(blank=True, null=True)),
                ('achievement', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='achievements.achievement')),
                ('glaze', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='glazes.glaze')),
                ('recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
                ('sender', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sent_notifications', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-creation_date'],
            },
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['recipient', '-creation_date'], name='notificatio_recipie_idx'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['recipient', 'is_read'], name='notificatio_recipie_is_read_idx'),
        ),
    ]

# Made with Bob
