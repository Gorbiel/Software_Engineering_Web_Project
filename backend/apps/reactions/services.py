from rest_framework.exceptions import ValidationError

from apps.reactions.models import Reaction


ALLOWED_REACTIONS = {
    "heart": {"name": "Heart", "emoji": "❤️"},
    "clap": {"name": "Clap", "emoji": "👏"},
    "fire": {"name": "Fire", "emoji": "🔥"},
    "laugh": {"name": "Laugh", "emoji": "😂"},
    "thumbs_up": {"name": "Thumbs Up", "emoji": "👍"},
}


def normalize_reaction_code(code):
    return code.strip().lower().replace(" ", "_")


def get_allowed_reaction_metadata(code):
    return ALLOWED_REACTIONS.get(code)


def list_available_reactions():
    reactions = []
    for code, metadata in ALLOWED_REACTIONS.items():
        reaction, _ = Reaction.objects.get_or_create(
            code=code,
            defaults={"name": metadata["name"]},
        )
        reactions.append(reaction)
    return reactions


def resolve_reaction_definition(reaction_id=None, code=None, name=None):
	if reaction_id:
		try:
			return Reaction.objects.get(id=reaction_id)
		except Reaction.DoesNotExist as exc:
			raise ValidationError({"reaction_id": "Reaction does not exist."}) from exc

		reaction_code = normalize_reaction_code(reaction.code)
		if reaction_code not in ALLOWED_REACTIONS:
			raise ValidationError({"reaction_id": "Reaction is not allowed."})

		return reaction

	if not code:
		raise ValidationError({"detail": "reaction_id or code is required."})

	normalized_code = normalize_reaction_code(code)
	allowed_reaction = get_allowed_reaction_metadata(normalized_code)
	if allowed_reaction is None:
		raise ValidationError(
			{
				"code": "Unsupported reaction. Allowed values: heart, clap, fire, laugh, thumbs up."
			}
		)

	reaction, _ = Reaction.objects.get_or_create(
		code=normalized_code,
		defaults={"name": allowed_reaction["name"]},
	)
	return reaction
