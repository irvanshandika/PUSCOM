export function PasswordStrengthIndicator({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length > 7) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = getStrength(password);

  return (
    <div className="flex space-x-1 mt-2">
      {[1, 2, 3, 4, 5].map((level) => (
        <div key={level} className={`h-1 w-full rounded-full ${strength >= level ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
      ))}
    </div>
  );
}
