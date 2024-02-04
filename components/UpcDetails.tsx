import { UpcProduct } from "@/types/UpcResponse";
import { UpcDetailsForm } from "./UpcDetailsForm";

type UpcDetailsProps = {
  onClose: () => void;
  upcProduct?: UpcProduct;
};

export function UpcDetails(props: UpcDetailsProps) {
  const { onClose, upcProduct } = props;

  if (!upcProduct) return null;
  return <UpcDetailsForm onClose={onClose} upcProduct={upcProduct}/>
}
