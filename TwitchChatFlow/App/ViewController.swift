import UIKit
import SafariServices

class ViewController: UIViewController {
    
    @IBOutlet weak var appNameLabel: UILabel!
    @IBOutlet weak var descriptionLabel: UILabel!
    @IBOutlet weak var instructionsTextView: UITextView!
    @IBOutlet weak var openSafariButton: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }
    
    private func setupUI() {
        title = "Twitch Chat Flow"
        view.backgroundColor = .systemBackground
        
        // Create UI elements programmatically if storyboard is not used
        if appNameLabel == nil {
            setupProgrammaticUI()
        }
        
        appNameLabel?.text = "Twitch Chat Flow"
        appNameLabel?.font = .systemFont(ofSize: 24, weight: .bold)
        appNameLabel?.textAlignment = .center
        
        descriptionLabel?.text = "Twitchのコメントをニコニコ動画風に表示"
        descriptionLabel?.font = .systemFont(ofSize: 16)
        descriptionLabel?.textAlignment = .center
        descriptionLabel?.textColor = .secondaryLabel
        
        let instructions = """
        使用方法:
        
        1. Safariを開く
        2. 設定 > Safari > 機能拡張 を選択
        3. "Twitch Chat Flow" を有効にする
        4. Twitchのライブ配信ページを開く
        5. チャットコメントが画面に流れます！
        
        注意: 初回使用時は、拡張機能の権限を許可してください。
        """
        
        instructionsTextView?.text = instructions
        instructionsTextView?.font = .systemFont(ofSize: 14)
        instructionsTextView?.isEditable = false
        instructionsTextView?.backgroundColor = .secondarySystemBackground
        instructionsTextView?.layer.cornerRadius = 8
        instructionsTextView?.contentInset = UIEdgeInsets(top: 8, left: 8, bottom: 8, right: 8)
        
        openSafariButton?.setTitle("Safariを開く", for: .normal)
        openSafariButton?.backgroundColor = .systemBlue
        openSafariButton?.setTitleColor(.white, for: .normal)
        openSafariButton?.layer.cornerRadius = 8
        openSafariButton?.addTarget(self, action: #selector(openSafari), for: .touchUpInside)
    }
    
    private func setupProgrammaticUI() {
        // Create UI elements if not using storyboard
        let stackView = UIStackView()
        stackView.axis = .vertical
        stackView.spacing = 20
        stackView.alignment = .fill
        stackView.translatesAutoresizingMaskIntoConstraints = false
        
        appNameLabel = UILabel()
        descriptionLabel = UILabel()
        instructionsTextView = UITextView()
        openSafariButton = UIButton(type: .system)
        
        stackView.addArrangedSubview(appNameLabel)
        stackView.addArrangedSubview(descriptionLabel)
        stackView.addArrangedSubview(instructionsTextView)
        stackView.addArrangedSubview(openSafariButton)
        
        view.addSubview(stackView)
        
        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            stackView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            stackView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            stackView.bottomAnchor.constraint(lessThanOrEqualTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -20),
            
            instructionsTextView.heightAnchor.constraint(greaterThanOrEqualToConstant: 200),
            openSafariButton.heightAnchor.constraint(equalToConstant: 44)
        ])
    }
    
    @objc private func openSafari() {
        guard let url = URL(string: "https://www.twitch.tv") else { return }
        
        if UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        }
    }
}