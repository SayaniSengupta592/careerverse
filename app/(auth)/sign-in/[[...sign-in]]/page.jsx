import { SignIn } from "@clerk/nextjs";

const Page = () => {
  return (
    <div className="flex justify-center">
      <SignIn
        signUpUrl="/sign-up"
        routing="path"
        path="/sign-in"
      />
    </div>
  );
};

export default Page;