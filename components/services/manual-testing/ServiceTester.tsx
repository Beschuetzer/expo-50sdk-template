import { Heading, Row, Stack } from 'native-base';

import { ServiceTesterButton } from './BffServiceTester';

import { Routes } from '@/constants/navigation';

type ServiceTesterProps = object;
export function ServiceTester(props: ServiceTesterProps) {
  return (
    <Stack>
      <Heading>Service Testing:</Heading>
      <Row>
        <ServiceTesterButton
          name="Bff Services"
          route={Routes.BffServiceTestScreen}
        />
      </Row>
    </Stack>
  );
}
