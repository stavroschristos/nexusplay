import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Full GDPR erasure for a user's personal data.
// Runs as the service role so it can delete records the user does not own
// (e.g. other users' follows/blocks toward them, reports about them, their
// presence and conversations). A user may only erase their own data; admins
// may erase any. The built-in User account itself is managed by the auth
// system — we only clear profile fields and remove related entities here.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let payload: any = {};
    try { payload = await req.json(); } catch { payload = {}; }
    const targetId = payload?.user_id;
    if (!targetId) return Response.json({ error: 'Missing user_id' }, { status: 400 });

    if (targetId !== caller.id && caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sr = base44.asServiceRole as any;
    const results: Record<string, string> = {};

    // [entity, filter, label]
    const tasks: Array<[string, any, string]> = [
      // Content the user authored
      ['GameAccount', { created_by_id: targetId }, 'game_accounts'],
      ['Achievement', { created_by_id: targetId }, 'achievements'],
      ['Post', { created_by_id: targetId }, 'posts'],
      ['Comment', { created_by_id: targetId }, 'comments'],
      ['Reaction', { created_by_id: targetId }, 'reactions'],
      ['Like', { created_by_id: targetId }, 'likes'],
      ['Collection', { created_by_id: targetId }, 'collections'],
      ['CollectionComment', { created_by_id: targetId }, 'collection_comments'],
      ['Memory', { created_by_id: targetId }, 'memories'],
      ['Timeline', { created_by_id: targetId }, 'timeline'],
      ['GameReview', { created_by_id: targetId }, 'reviews'],
      ['TopList', { created_by_id: targetId }, 'top_lists'],
      ['GamingSetup', { created_by_id: targetId }, 'gaming_setups'],
      ['LFG', { created_by_id: targetId }, 'lfg'],
      ['UserChallenge', { created_by_id: targetId }, 'user_challenges'],
      ['GameFollow', { created_by_id: targetId }, 'game_follows'],
      ['CommunityMember', { created_by_id: targetId }, 'community_memberships'],
      ['Report', { created_by_id: targetId }, 'reports_filed'],
      ['Feedback', { created_by_id: targetId }, 'feedback'],
      ['FeatureRequest', { created_by_id: targetId }, 'feature_requests'],
      ['FeatureVote', { created_by_id: targetId }, 'feature_votes'],
      ['Invite', { inviter_id: targetId }, 'invites_sent'],
      ['Message', { created_by_id: targetId }, 'messages_sent'],
      // Relationship records referencing the user (may be owned by others)
      ['Follow', { follower_id: targetId }, 'follows_out'],
      ['Follow', { following_id: targetId }, 'follows_in'],
      ['Block', { created_by_id: targetId }, 'blocks_made'],
      ['Block', { blocked_id: targetId }, 'blocks_against'],
      ['Notification', { recipient_id: targetId }, 'notifications'],
      ['Presence', { user_id: targetId }, 'presence'],
      ['Conversation', { participant_ids: targetId }, 'conversations'],
      ['Report', { target_type: 'user', target_id: targetId }, 'reports_about_user'],
    ];

    await Promise.allSettled(
      tasks.map(([entity, filter, label]) =>
        sr.entities[entity].deleteMany(filter)
          .then(() => { results[label] = 'ok'; })
          .catch((e: Error) => { results[label] = `error: ${e.message}`; })
      )
    );

    // Anonymize residual references to the user inside other users'
    // notifications (don't delete others' data — just strip the actor identity).
    try {
      await sr.entities.Notification.updateMany(
        { actor_id: targetId },
        { $set: { actor_name: 'Deleted Gamer', actor_id: '' } }
      );
      results['notifications_actor_anonymized'] = 'ok';
    } catch (e: any) {
      results['notifications_actor_anonymized'] = `error: ${e.message}`;
    }

    return Response.json({ status: 'success', results });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});