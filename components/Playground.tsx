import { AspectRatio, Center, Image } from "native-base";
import { Dimensions } from "react-native";

export function Playground() {
    return (
      <>
        <Center h="40" w="20" bg="primary.300" rounded="md" shadow={3}>
          <AspectRatio
            ratio={{
              base: .5,
              md: .1,
            }}
            height={{
              base: 'auto',
              md: 'auto',
            }}
          >
            <Image
              resizeMode="cover"
              source={{
                uri: "https://images.pexels.com/photos/60597/dahlia-red-blossom-bloom-60597.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
              }}
              alt="Picture of a Flower"
            />
          </AspectRatio>
        </Center>
        <Center h="40" w="20" bg="primary.500" rounded="md" shadow={3} />
        <Center h="40" w="20" bg="primary.700" rounded="md" shadow={3} />
      </>
    );
}