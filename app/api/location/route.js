import { supabase } from "@/utils/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        console.log("Request received");
        const { address, pincode, city, latitude, longitude } = await request.json();

        if (!address || !pincode || !city || !latitude || !longitude) {
            return NextResponse.json(
                { message: "All fields sent data are required" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('locations')
            .insert({ address, pincode, city, latitude, longitude });

        if (error) {
            throw error;
        }

        return NextResponse.json({ message: "Location saved successfully" }, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const { data: locations, error } = await supabase
            .from('locations')
            .select('*');

        if (error) {
            throw error;
        }

        // Transform data to match previous Mongoose schema structure if needed by frontend
        // Mongoose schema had: geolocation: { latitude, longitude }
        // We also map 'id' to '_id' to minimize frontend breakage if it expects _id
        const formattedLocations = locations.map(loc => ({
            ...loc,
            _id: loc.id, // Alias id to _id
            geolocation: {
                latitude: loc.latitude,
                longitude: loc.longitude
            }
        }));

        return NextResponse.json({ locations: formattedLocations }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ message: "Location ID required" }, { status: 400 });
        }

        const { error } = await supabase
            .from('locations')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ message: "Location deleted successfully" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, address, city, pincode, latitude, longitude } = body;

        if (!id) {
            return NextResponse.json({ message: "Location ID required" }, { status: 400 });
        }

        const { data: updatedLocation, error } = await supabase
            .from('locations')
            .update({
                address,
                city,
                pincode,
                latitude,
                longitude
            })
            .eq('id', id)
            .select() // Return the updated record
            .single();

        if (error) {
            throw error;
        }

        if (!updatedLocation) {
            return NextResponse.json({ message: "Location not found" }, { status: 404 });
        }

        // Format response to match expected structure
        const formattedLocation = {
            ...updatedLocation,
            _id: updatedLocation.id,
            geolocation: {
                latitude: updatedLocation.latitude,
                longitude: updatedLocation.longitude
            }
        };

        return NextResponse.json({ message: "Location updated successfully", location: formattedLocation }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
