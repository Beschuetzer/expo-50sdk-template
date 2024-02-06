import { UpcDetailsForm } from "./UpcDetailsForm";

type UpcDetailsProps = {
  onClose: () => void;
};

export function UpcDetails(props: UpcDetailsProps) {
  const { onClose } = props;
  return <UpcDetailsForm onClose={onClose} />;
}
