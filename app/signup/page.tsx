import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold tracking-tight text-neutral-900 inline-block hover:scale-105 transition-transform">
            Type<span className="text-emerald-600">Setu</span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-neutral-800">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Join students clearing Indian Govt typing exams
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white py-8 px-4 sm:px-10 shadow-xl shadow-neutral-200/50 rounded-2xl border border-neutral-100">
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full appearance-none rounded-xl border border-neutral-200 px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Rohan Sharma"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                className="w-full appearance-none rounded-xl border border-neutral-200 px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full appearance-none rounded-xl border border-neutral-200 px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Create a strong password"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-emerald-600/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all active:scale-[0.98]"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm font-medium text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 hover:text-emerald-500 font-bold">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}