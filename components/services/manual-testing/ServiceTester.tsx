import { Heading, HStack, VStack } from '@gluestack-ui/themed';

import { ServiceTesterButton } from './BffServiceTester';

import { Routes } from '@/constants/navigation';

type ServiceTesterProps = object;
export function ServiceTester(props: ServiceTesterProps) {
  return (
    <VStack>
      <Heading>Service Testing:</Heading>
      <HStack>
        <ServiceTesterButton
          name="Bff Services"
          route={Routes.BffServiceTestScreen}
        />
      </HStack>
    </VStack>
  );
}
