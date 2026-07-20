import test from 'node:test';
import assert from 'node:assert/strict';

import { ConversationAttemptGuard } from '../../app/frontend/conversation-attempt-guard.js';

test('ConversationAttemptGuard rejects an attempt after cancellation', () => {
    const guard = new ConversationAttemptGuard();
    const attempt = guard.begin();

    assert.equal(guard.isCurrent(attempt), true);

    guard.cancel();

    assert.equal(guard.isCurrent(attempt), false);
});

test('ConversationAttemptGuard makes a newer attempt supersede an older one', () => {
    const guard = new ConversationAttemptGuard();
    const first = guard.begin();
    const second = guard.begin();

    assert.equal(guard.isCurrent(first), false);
    assert.equal(guard.isCurrent(second), true);
});
