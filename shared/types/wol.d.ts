export interface YeartextDetails {
  articleClasses: string
  /**
   * The content of the year text in HTML.
   * @example '<p id="p1" data-pid="1">Line 1</p>\r\n<p id="p2" data-pid="2">Line 2</p>\r\n'
   */
  content: string
  /**
   * The location of the year text in HTML.
   * @example '<strong>yt26</strong>'
   */
  location: string
  /**
   * The title of the year text in HTML.
   * @example '<strong>“Happy are those conscious of their spiritual need.”—Matthew 5:3.</strong>'
   */
  title: string
}

export interface YeartextResult {
  /**
   * The content of the year text in HTML.
   * @example '<p id="p1" data-pid="1">Line 1</p>\r\n<p id="p2" data-pid="2">Line 2</p>\r\n'
   */
  content: string
  exists: boolean
  jsonUrl: string
  url: string
}
