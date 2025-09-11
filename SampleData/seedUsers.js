import "dotenv/config"
import { createClient } from "@supabase/supabase-js"

// Load your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY  // ⚠️ use service role, not anon!

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables")
}

// Admin client (bypasses RLS, can manage users)
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function seedUsers() {
  const users = [
    {
      email: "admin@clinic.com",
      password: "AdminPass123",
      full_name: "System Administrator",
      role: "admin",
      phone: "+1-555-0001",
    },
    {
      email: "dr.smith@clinic.com",
      password: "DoctorPass123",
      full_name: "Dr. John Smith",
      role: "doctor",
      phone: "+1-555-0002",
    },
    {
      email: "dr.johnson@clinic.com",
      password: "DoctorPass123",
      full_name: "Dr. Sarah Johnson",
      role: "doctor",
      phone: "+1-555-0003",
    },
    {
      email: "dr.williams@clinic.com",
      password: "DoctorPass123",
      full_name: "Dr. Michael Williams",
      role: "doctor",
      phone: "+1-555-0004",
    },
    {
      email: "nurse.mary@clinic.com",
      password: "NursePass123",
      full_name: "Mary Wilson",
      role: "nurse",
      phone: "+1-555-0005",
    },
  ]

  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    })

    if (error) {
      console.error(`❌ Failed to create user ${user.email}:`, error.message)
    } else {
      console.log(`✅ Created user ${user.email} with id:`, data.user.id)

      // ensure user exists in your public.users table
      const { error: insertError } = await supabase
        .from("users")
        .upsert({
          id: data.user.id, // keep same UUID as auth.users
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
        })

      if (insertError) {
        console.error(`⚠️ Failed to insert into public.users for ${user.email}:`, insertError.message)
      } else {
        console.log(`   ↳ Synced ${user.email} into public.users`)
      }
    }
  }
}

seedUsers()
  .then(() => console.log("🎉 Seeding complete"))
  .catch((err) => console.error("Fatal error:", err))
