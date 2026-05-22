import { MissingBillState } from "@/components/molecules";

/** Legacy mock share route — API flow uses bill detail instead. */
export default function ShareBillScreen() {
  return (
    <MissingBillState
      title="Share"
      message="Missing bill. Please open a bill from Home."
    />
  );
}
