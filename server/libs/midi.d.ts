declare module "midi" {

  export class output  {
    openPort(portNumber: number);

    /**
     * @param midiCommand [commandAndChannel,data1,data2]
     */
    sendMessage(midiCommand: number[]);
  }

}
