CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.agentes_publicos(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
  public.get_user_perfil() = 'admin'
);

-- Function to handle audit logging
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_old_data JSONB;
    v_new_data JSONB;
    v_record_id UUID;
BEGIN
    -- Try to find the agente_publico associated with the current auth user
    SELECT id INTO v_user_id
    FROM public.agentes_publicos
    WHERE email = auth.jwt() ->> 'email'
    LIMIT 1;

    IF (TG_OP = 'DELETE') THEN
        v_old_data = to_jsonb(OLD);
        v_new_data = null;
        v_record_id = OLD.id;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_old_data = to_jsonb(OLD);
        v_new_data = to_jsonb(NEW);
        v_record_id = NEW.id;
    ELSIF (TG_OP = 'INSERT') THEN
        v_old_data = null;
        v_new_data = to_jsonb(NEW);
        v_record_id = NEW.id;
    END IF;

    INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data
    ) VALUES (
        v_user_id,
        TG_OP,
        TG_TABLE_NAME,
        v_record_id,
        v_old_data,
        v_new_data
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for DFDs
DROP TRIGGER IF EXISTS tr_audit_dfds ON public.dfds;
CREATE TRIGGER tr_audit_dfds
AFTER INSERT OR UPDATE OR DELETE ON public.dfds
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
