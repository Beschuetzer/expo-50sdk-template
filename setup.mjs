import fs from 'fs';
import os from 'os';

//#region ENV Files setup
export const BACKEND_PORT = 4200;
export const EXPO_PUBLIC_IP_ADDRESS_STRING = 'EXPO_PUBLIC_IP_ADDRESS';
export const EXPO_PUBLIC_PORT_NUMBER_STRING = 'EXPO_PUBLIC_PORT_NUMBER';
//#endregion

const ENV_FILE_PATH = './.env';

async function addIpAddressToEnvFile() {
  let lines;
  const toWrite = [
    `${EXPO_PUBLIC_IP_ADDRESS_STRING}=${getIPAddress()}`,
    `${EXPO_PUBLIC_PORT_NUMBER_STRING}=${BACKEND_PORT}`,
  ];
  const ipAddressRegex = new RegExp(
    `\s*${EXPO_PUBLIC_IP_ADDRESS_STRING}\s*`,
    'ig',
  );
  const portNumberRegex = new RegExp(
    `\s*${EXPO_PUBLIC_PORT_NUMBER_STRING}\s*`,
    'ig',
  );

  try {
    const data = await fs.promises.readFile(ENV_FILE_PATH, 'utf-8');
    lines =
      data
        ?.split('\n')
        ?.map((data) => data.trim())
        .filter(
          (data) =>
            !data.match(ipAddressRegex) &&
            !data.match(portNumberRegex) &&
            Boolean(data),
        ) || [];
  } catch (error) {
    await fs.promises.writeFile(
      ENV_FILE_PATH,
      `\n${toWrite[0]}\n${toWrite[1]}`,
      'utf-8',
    );
    return;
  }

  lines.forEach((line) => toWrite.push(line));
  await fs.promises.writeFile(ENV_FILE_PATH, `${toWrite.join('\n')}`, 'utf-8');
}

function getIPAddress() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      // Skip over internal IPv6 addresses and loopback addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  throw new Error('IP address could not be determined');
}

addIpAddressToEnvFile();
