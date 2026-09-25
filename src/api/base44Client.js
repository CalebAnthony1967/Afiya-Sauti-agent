import { supabase } from '@/lib/supabase';

// Map Base44 entity names to Supabase PostgreSQL table names
const ENTITY_TABLE_MAP = {
  Profile: 'profiles',
  Facility: 'facilities',
  Household: 'households',
  PatientConsent: 'patient_consents',
  TriageSession: 'triage_sessions',
  VitalTelemetry: 'vital_telemetry',
  ClinicalSoapNote: 'clinical_soap_notes',
  Appointment: 'appointments',
  MedicationRegimen: 'medication_regimens',
  AdherenceEvent: 'adherence_events',
  SecureMessage: 'secure_messages',
  ChpDispatch: 'chp_dispatches',
  ChpTask: 'chp_tasks',
  AIInferenceMetric: 'ai_inference_metrics',
  AgentActivityLog: 'agent_activity_logs',
  AuditLog: 'audit_logs',
  Protocol: 'protocols',
  TrainingScenario: 'training_scenarios',
  OutbreakSignal: 'outbreak_signals',
  ApiKey: 'api_keys',
  SupportTicket: 'support_tickets',
  UsageEvent: 'usage_events',
  Translation: 'translations',
};

function toTableName(entityName) {
  if (ENTITY_TABLE_MAP[entityName]) {
    return ENTITY_TABLE_MAP[entityName];
  }
  // Convert PascalCase to snake_case
  return (
    entityName
      .replace(/([a-z\d])([A-Z])/g, '$1_$2')
      .toLowerCase() + 's'
  );
}

function resolveColumn(tableName, col) {
  if (!col) return 'created_at';
  if (col === 'created_date' || col === 'created_at') {
    if (
      tableName === 'vital_telemetry' ||
      tableName === 'agent_activity_logs' ||
      tableName === 'audit_logs'
    ) {
      return 'timestamp';
    }
    if (tableName === 'outbreak_signals') {
      return 'detected_at';
    }
    if (tableName === 'chp_dispatches') {
      return 'dispatched_at';
    }
    if (tableName === 'usage_events') {
      return 'recorded_at';
    }
    if (tableName === 'patient_consents') {
      return 'updated_at';
    }
    return 'created_at';
  }
  return col;
}

function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  const ts =
    row.timestamp ||
    row.detected_at ||
    row.dispatched_at ||
    row.recorded_at ||
    row.created_at ||
    row.created_date ||
    new Date().toISOString();
  return {
    ...row,
    created_date: row.created_date || ts,
    created_at: row.created_at || ts,
    timestamp: row.timestamp || ts,
  };
}

function prepareRecord(tableName, payload) {
  const record = { ...payload };
  if (!record.id) {
    record.id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'id_' + Math.random().toString(36).substring(2, 9);
  }
  if (
    tableName === 'vital_telemetry' ||
    tableName === 'audit_logs' ||
    tableName === 'agent_activity_logs'
  ) {
    if (!record.timestamp && (record.created_date || record.created_at)) {
      record.timestamp = record.created_date || record.created_at;
    }
    delete record.created_date;
  }
  return record;
}

function createEntityHandler(entityName) {
  const tableName = toTableName(entityName);

  return {
    async list(sort = '-created_at', limit = 100) {
      try {
        let query = supabase.from(tableName).select('*');
        let orderedCol = null;
        let isDesc = true;

        if (sort && typeof sort === 'string') {
          isDesc = sort.startsWith('-');
          const rawCol = isDesc ? sort.slice(1) : sort;
          orderedCol = resolveColumn(tableName, rawCol);
          query = query.order(orderedCol, { ascending: !isDesc });
        }
        if (limit && typeof limit === 'number') {
          query = query.limit(limit);
        }
        let { data, error } = await query;

        // If the ordering column did not exist, fallback to query without ordering
        if (error && (error.code === '42703' || error.message?.includes('does not exist'))) {
          let retry = supabase.from(tableName).select('*');
          if (limit && typeof limit === 'number') {
            retry = retry.limit(limit);
          }
          const retryRes = await retry;
          if (!retryRes.error && Array.isArray(retryRes.data)) {
            data = retryRes.data;
            error = null;
          }
        }

        if (error) {
          console.warn(`[Supabase list ${tableName}]`, error.message);
          return [];
        }
        return Array.isArray(data) ? data.map(normalizeRow) : [];
      } catch (err) {
        console.warn(`[Supabase list ${tableName} catch]`, err);
        return [];
      }
    },

    async filter(criteria = {}, sort = '-created_at', limit = 100) {
      try {
        let query = supabase.from(tableName).select('*');
        if (criteria && typeof criteria === 'object') {
          for (const [key, value] of Object.entries(criteria)) {
            const mappedKey = resolveColumn(tableName, key);
            query = query.eq(mappedKey, value);
          }
        }
        if (sort && typeof sort === 'string') {
          const isDesc = sort.startsWith('-');
          const rawCol = isDesc ? sort.slice(1) : sort;
          const col = resolveColumn(tableName, rawCol);
          query = query.order(col, { ascending: !isDesc });
        }
        if (limit && typeof limit === 'number') {
          query = query.limit(limit);
        }
        let { data, error } = await query;

        // Fallback without ordering if column was not found
        if (error && (error.code === '42703' || error.message?.includes('does not exist'))) {
          let retry = supabase.from(tableName).select('*');
          if (criteria && typeof criteria === 'object') {
            for (const [key, value] of Object.entries(criteria)) {
              retry = retry.eq(resolveColumn(tableName, key), value);
            }
          }
          if (limit && typeof limit === 'number') {
            retry = retry.limit(limit);
          }
          const retryRes = await retry;
          if (!retryRes.error && Array.isArray(retryRes.data)) {
            data = retryRes.data;
            error = null;
          }
        }

        if (error) {
          console.warn(`[Supabase filter ${tableName}]`, error.message);
          return [];
        }
        return Array.isArray(data) ? data.map(normalizeRow) : [];
      } catch (err) {
        console.warn(`[Supabase filter ${tableName} catch]`, err);
        return [];
      }
    },

    async get(id) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) {
          console.warn(`[Supabase get ${tableName}]`, error.message);
          return null;
        }
        return data ? normalizeRow(data) : null;
      } catch (err) {
        console.warn(`[Supabase get ${tableName} catch]`, err);
        return null;
      }
    },

    async create(payload) {
      try {
        const record = prepareRecord(tableName, payload);
        const { data, error } = await supabase
          .from(tableName)
          .insert([record])
          .select()
          .maybeSingle();
        if (error) {
          console.warn(`[Supabase insert ${tableName}]`, error.message);
          return normalizeRow(record);
        }
        return normalizeRow(data || record);
      } catch (err) {
        console.warn(`[Supabase insert ${tableName} catch]`, err);
        return normalizeRow(payload);
      }
    },

    async update(id, payload) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .update(payload)
          .eq('id', id)
          .select()
          .maybeSingle();
        if (error) {
          console.warn(`[Supabase update ${tableName}]`, error.message);
          return { id, ...payload };
        }
        return data || { id, ...payload };
      } catch (err) {
        console.warn(`[Supabase update ${tableName} catch]`, err);
        return { id, ...payload };
      }
    },

    async delete(id) {
      try {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) {
          console.warn(`[Supabase delete ${tableName}]`, error.message);
        }
        return true;
      } catch (err) {
        console.warn(`[Supabase delete ${tableName} catch]`, err);
        return true;
      }
    },

    subscribe(callback) {
      try {
        const channelName = `rt_${tableName}_${Math.random().toString(36).substring(2, 7)}`;
        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: tableName },
            (payload) => {
              if (typeof callback === 'function') {
                callback(payload);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.warn(`[Supabase subscribe ${tableName} catch]`, err);
        return () => {};
      }
    },
  };
}

// Proxied entities container so any base44.entities.<EntityName> works with Supabase
const entitiesProxy = new Proxy(
  {},
  {
    get(target, prop) {
      if (typeof prop === 'string') {
        if (!target[prop]) {
          target[prop] = createEntityHandler(prop);
        }
        return target[prop];
      }
      return undefined;
    },
  }
);

// Supabase-backed client adhering to the API interface
export const base44 = {
  supabase,
  entities: entitiesProxy,
  auth: {
    async me() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          return {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || 'Dr. Amina Ochieng',
            role: data.user.user_metadata?.role || 'clinician',
          };
        }
      } catch {
        // Fallback demo user
      }
      return {
        id: 'usr_clinician_01',
        email: 'clinician@afiyasauti.ke',
        full_name: 'Dr. Amina Ochieng',
        role: 'clinician',
      };
    },
    async logout() {
      try {
        await supabase.auth.signOut();
      } catch {
        // Safe fallback
      }
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
    redirectToLogin(url) {
      if (typeof window !== 'undefined') {
        window.location.href = url || '/';
      }
    },
  },
  app: {
    async getPublicSettings() {
      return {
        id: 'afiya-sauti',
        public_settings: {
          auth_required: false,
        },
      };
    },
  },
  functions: {
    async invoke(functionName, args = {}) {
      try {
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: args,
        });
        if (error) throw error;
        return data;
      } catch {
        return { success: true, message: `Invoked ${functionName}` };
      }
    },
  },
};

export default base44;
