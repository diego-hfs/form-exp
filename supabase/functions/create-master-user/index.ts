// Edge function: cria o usuário master diego.hernando com 4 roles
// Executar via: supabase functions invoke create-master-user
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const NOME = "diego.hernando";
    const EMAIL = "diego.hernando@interno.app";
    const PASSWORD = "Wms.2020";
    const ROLES = ["separador", "conferente", "fiscal", "lider"] as const;

    // 1. Verifica se já existe profile com esse nome
    const { data: existente } = await supabase
      .from("profiles")
      .select("id")
      .ilike("nome", NOME)
      .maybeSingle();

    let userId: string;

    if (existente) {
      userId = existente.id;
      // Atualiza senha
      await supabase.auth.admin.updateUserById(userId, { password: PASSWORD });
    } else {
      // 2. Cria usuário no auth (auto-confirma)
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { nome: NOME },
      });
      if (createErr) throw createErr;
      userId = created.user!.id;

      // 3. Garante o profile (caso o trigger não tenha rodado)
      await supabase.from("profiles").upsert({
        id: userId,
        nome: NOME,
        email_gerado: EMAIL,
      });
    }

    // 4. Remove roles antigas e insere as 4
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const rows = ROLES.map((role) => ({ user_id: userId, role, nome: NOME }));
    const { error: rolesErr } = await supabase.from("user_roles").insert(rows);
    if (rolesErr) throw rolesErr;

    return new Response(
      JSON.stringify({ success: true, user_id: userId, nome: NOME, roles: ROLES }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
