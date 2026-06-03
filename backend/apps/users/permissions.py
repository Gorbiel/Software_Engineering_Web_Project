"""Backward-compatibility shim.

Historically other modules imported `IsGlazedInAdmin` and `IsSelf` from
`apps.users.permissions`. These classes are now implemented in
`common.permissions`. This module re-exports them so existing imports
continue to work. You can update imports to `common.permissions` and
remove this shim in a future release.
"""

from common.permissions import IsGlazedInAdmin, IsSelf

__all__ = ["IsGlazedInAdmin", "IsSelf"]
