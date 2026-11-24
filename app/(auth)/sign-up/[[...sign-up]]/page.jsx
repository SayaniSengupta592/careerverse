import { SignUp } from "@clerk/nextjs";

const Page = () => {
  return (
    <div className="flex justify-center">
      <SignUp
        signInUrl="/sign-in"
        routing="path"
        path="/sign-up"
      />
    </div>
  );
};

export default Page;