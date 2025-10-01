import { BookOpen, Star, Target, TestTube2, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import { useUser } from "src/stores/userStore";

export default function Home() {
  const user = useUser((state) => state.user);

  return (
    <div className="bg-amber-50 text-gray-800">
      {/* Hero Section */}
      <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-[url(/imgs/bg/login.png)] bg-cover bg-center">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome to Mathslide Learning!
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-700">
            Your fun and interactive way to master math. Ready to start your learning adventure?
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {!user ? (
              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                Get Started for Free
              </Link>
            ) : (
              <Link
                to="/slides"
                className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                View Slides
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Why Mathslide?</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to excel in math
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our platform is designed to make learning math intuitive, engaging, and effective for students of all
              levels.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  Interactive Slides
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Learn concepts step-by-step with our engaging and easy-to-follow slide decks.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <TestTube2 className="h-6 w-6 text-white" />
                  </div>
                  Practice Problems
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Solidify your understanding with a wide variety of practice questions for every topic.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  Progress Tracking
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Monitor your progress and identify areas for improvement with our detailed analytics.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  Personalized Learning
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Our platform adapts to your learning style, providing a customized experience.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-amber-100/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How It Works</h2>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Sign Up</h3>
              <p className="mt-2 text-base text-gray-600">Create your free account in just a few clicks.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Choose a Topic</h3>
              <p className="mt-2 text-base text-gray-600">Browse our library of math topics and start learning.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Start Sliding</h3>
              <p className="mt-2 text-base text-gray-600">Engage with interactive slides and practice problems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-blue-600">Testimonials</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What Our Students Are Saying
            </p>
          </div>
          <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
            <div className="-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3">
              <div className="pt-8 sm:inline-block sm:w-full sm:px-4">
                <figure className="rounded-2xl bg-gray-50 p-8 text-sm leading-6">
                  <blockquote className="text-gray-900">
                    <p>
                      “Mathslide has been a game-changer for me. The interactive slides make learning so much more fun
                      and effective than just reading a textbook.”
                    </p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <div className="font-semibold text-gray-900">Sarah L.</div>
                    <div className="flex text-yellow-500">
                      <Star fill="currentColor" size={16} />
                      <Star fill="currentColor" size={16} />
                      <Star fill="currentColor" size={16} />
                      <Star fill="currentColor" size={16} />
                      <Star fill="currentColor" size={16} />
                    </div>
                  </figcaption>
                </figure>
              </div>
              <div className="pt-8 sm:inline-block sm:w-full sm:px-4">
                <figure className="rounded-2xl bg-gray-50 p-8 text-sm leading-6">
                  <blockquote className="text-gray-900">
                    <p>
                      “I used to struggle with algebra, but the practice problems and clear explanations on this
                      platform have really helped me improve my grades.”
                    </p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <div className="font-semibold text-gray-900">David C.</div>
                    <div className="flex text-yellow-500">
                      <Star fill="currentColor" size={16} />
                      <Star fill="currentColor" size={16} />
                      <Star fill="currentColor" size={16} />
                      <Star fill="currentColor" size={16} />
                      <Star fill="currentColor" size={16} />
                    </div>
                  </figcaption>
                </figure>
              </div>
              <div className="pt-8 sm:inline-block sm:w-full sm:px-4">
                <figure className="rounded-2xl bg-gray-50 p-8 text-sm leading-6">
                  <blockquote className="text-gray-900">
                    <p>
                      “As a parent, I love that I can track my child's progress and see where they need extra help.
                      Highly recommended!”
                    </p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <div className="font-semibold text-gray-900">Emily R.</div>
                    <div className="flex text-yellow-500">
                      <Star fill="currentColor" size={16} />
                      <Star fill="currentColor" size={16} />
                      <Star fill="currentColor" size={16} />
                      <Star fill="currentColor" size={16} />
                      <Star fill="currentColor" size={16} />
                    </div>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <div className="bg-amber-100/50">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to dive in?
            <br />
            Start learning with Mathslide today.
          </h2>
          <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            {!user ? (
              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                Sign up for free
              </Link>
            ) : (
              <Link
                to="/exams"
                className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                Start practicing now!
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
