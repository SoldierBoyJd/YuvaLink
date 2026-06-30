-- Run in Supabase SQL Editor
-- Updates connect/disconnect functions for proper request/accept flow

-- Disable RLS (already done, but safe to re-run)
ALTER TABLE connections DISABLE ROW LEVEL SECURITY;

-- Send a connection REQUEST (only sender's side, status = pending)
CREATE OR REPLACE FUNCTION connect_users(p_user_id UUID, p_peer_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert sender -> receiver as pending
  INSERT INTO connections (user_id, connected_user_id, status)
  VALUES (p_user_id, p_peer_id, 'pending')
  ON CONFLICT (user_id, connected_user_id)
  DO UPDATE SET status = 'pending';
END;
$$;

-- Accept a connection request (update sender's row + insert receiver's row)
CREATE OR REPLACE FUNCTION accept_connection(p_user_id UUID, p_requester_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update requester's pending row to accepted
  UPDATE connections
  SET status = 'accepted'
  WHERE user_id = p_requester_id AND connected_user_id = p_user_id;

  -- Insert acceptor's side
  INSERT INTO connections (user_id, connected_user_id, status)
  VALUES (p_user_id, p_requester_id, 'accepted')
  ON CONFLICT (user_id, connected_user_id)
  DO UPDATE SET status = 'accepted';
END;
$$;

-- Disconnect or decline (remove both sides)
CREATE OR REPLACE FUNCTION disconnect_users(p_user_id UUID, p_peer_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM connections
  WHERE (user_id = p_user_id AND connected_user_id = p_peer_id)
     OR (user_id = p_peer_id AND connected_user_id = p_user_id);
END;
$$;
