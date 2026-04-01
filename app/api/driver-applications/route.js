import { supabase } from "@/utils/supabase";

export async function POST(request) {
    try {
        const body = await request.json();
        const { fullName, email, phone, licenseNumber, experienceYears } = body;

        if (!fullName || !email || !phone || !licenseNumber) {
            return new Response(JSON.stringify({ message: "Required fields are missing" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { data, error } = await supabase
            .from('driver_applications')
            .insert({
                full_name: fullName,
                email: email,
                phone: phone,
                license_number: licenseNumber,
                experience_years: parseInt(experienceYears) || 0,
                status: 'pending'
            })
            .select('*')
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new Response(JSON.stringify({ message: "Application submitted successfully", application: data }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Application submission error:", error);
        return new Response(JSON.stringify({ message: "Failed to submit application", error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function GET(request) {
    try {
        const { data, error } = await supabase
            .from('driver_applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return new Response(JSON.stringify({ applications: data || [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Fetching applications error:", error);
        return new Response(JSON.stringify({ message: "Failed to fetch applications", error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return new Response(JSON.stringify({ message: "ID and status are required" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { data, error } = await supabase
            .from('driver_applications')
            .update({ status: status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new Response(JSON.stringify({ message: `Application updated to ${status}`, application: data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Update application error:", error);
        return new Response(JSON.stringify({ message: "Failed to update application", error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
