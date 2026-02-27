import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const resHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: resHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Get the JWT from the Authorization header
        const authHeader = req.headers.get('Authorization')!
        const token = authHeader.replace('Bearer ', '')

        // Verify that the user making the request is an admin
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...resHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Verify the user is actually an admin in the public.users table
        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userError || userData.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Forbidden: Admins only' }), {
                status: 403,
                headers: { ...resHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Parse the request body
        const { email, password, name, role, location } = await req.json()

        // Create the new user using the admin API
        const { data: newAuthUser, error: createError } = await supabaseClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm so there's no email required to be verified
            user_metadata: {
                name,
                role,
                location
            }
        })

        if (createError) throw createError

        return new Response(JSON.stringify({ user: newAuthUser }), {
            headers: { ...resHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...resHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
